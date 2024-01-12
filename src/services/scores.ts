import { ServicesError } from '@/exceptions';
import { ScoreModel } from '@/models/scores';
import type { Knex } from 'knex';
import { Service } from 'typedi';

@Service()
class ScoreServiceFile {
  get getModel(): Knex<any, any[]> {
    return ScoreModel.knex();
  }

  public async improveSearchScore(
    { year, month, day, searches }: { year: number; month: number; day: number; searches: number },
    userId: number,
  ): Promise<ScoreModel> {
    try {
      return await ScoreModel.query()
        .insert({
          userId,
          year,
          month,
          day,
          searches,
        })
        .onConflict(['userId', 'year', 'month', 'day'])
        .merge({
          searches: ScoreModel.raw('?? + ?', ['scores.searches', searches]),
        });
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async improveProfilScore(
    { year, month, day, profils }: { year: number; month: number; day: number; profils: number },
    userId: number,
  ): Promise<ScoreModel> {
    try {
      return await ScoreModel.query()
        .insert({
          userId,
          year,
          month,
          day,
          profils,
        })
        .onConflict(['userId', 'year', 'month', 'day'])
        .merge({
          profils: ScoreModel.raw('?? + ?', ['scores.profils', profils]),
        });
    } catch (err) {
      console.log(err);

      throw new ServicesError();
    }
  }

  public async getUserScores({ year, month, day }: { year: number; month: number; day: number }, userId: number): Promise<ScoreModel> {
    try {
      return await ScoreModel.query().where({ year, month, day, userId }).select('searches', 'profils', 'year', 'month', 'day').first();
    } catch (err) {
      console.log(err);

      throw new ServicesError();
    }
  }
  public async getUserRangeScores(
    { year, month, day }: { year: number; month: number; day: number },
    { RgYear, RgMonth, RgDay }: { RgYear: number; RgMonth: number; RgDay: number },
    userId: number,
  ): Promise<ScoreModel[]> {
    try {
      const startDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const endDate = `${RgYear}-${RgMonth.toString().padStart(2, '0')}-${RgDay.toString().padStart(2, '0')}`;

      const query = ScoreModel.query()
        .where({ userId })
        .whereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') >= ?`, [startDate])
        .andWhereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') <= ?`, [endDate]);

      return await query.select('searches', 'profils', 'year', 'month', 'day').orderBy('id', 'asc');
    } catch (err) {
      console.log(err);
      throw new ServicesError();
    }
  }
}

export default ScoreServiceFile;
