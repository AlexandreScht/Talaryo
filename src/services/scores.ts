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
      throw new ServicesError();
    }
  }

  public async getUserScores({ year, month, day }: { year: number; month: number; day: number }, userId: number): Promise<ScoreModel> {
    try {
      return await ScoreModel.query().where({ year, month, day, userId }).select('searches', 'profils', 'year', 'month', 'day').first();
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async getTotalMonthSearches(userId: number): Promise<number> {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const formatDate = (date: Date): string => {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      };
      const startDate = formatDate(firstDayOfMonth);
      const endDate = formatDate(lastDayOfMonth);

      const [{ totalSearches }] = await ScoreModel.query()
        .where({ userId })
        .whereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') >= ?`, [startDate])
        .andWhereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') <= ?`, [endDate])
        .sum('searches as totalSearches');
      return totalSearches;
    } catch (err) {
      throw new ServicesError(err.message || 'Error calculating total searches.');
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
      throw new ServicesError();
    }
  }
}

export default ScoreServiceFile;
