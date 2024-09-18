import { ServicesError } from '@/exceptions';
import { ScoreModel } from '@/models/pg/scores';
import { logger } from '@/utils/logger';
import { Service } from 'typedi';

@Service()
class ScoreServiceFile {
  public currentDate: Date = new Date();

  private extractDate(date: Date) {
    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  private getDateRangeQuery() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const formatDate = (date: Date): string => {
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    };
    const startDate = formatDate(firstDayOfMonth);
    const endDate = formatDate(lastDayOfMonth);
    return { startDate, endDate };
  }

  //; public methods
  public async improveScore(column: scoreColumn, count: number, userId: number): Promise<ScoreModel> {
    try {
      const { year, month, day } = this.extractDate(this.currentDate);
      return await ScoreModel.query()
        .insert({
          userId,
          year,
          month,
          day,
          [column]: count,
        })
        .onConflict(['userId', 'year', 'month', 'day'])
        .merge({
          [column]: ScoreModel.raw('?? + ?', [`scores.${column}`, count]),
        });
    } catch (err) {
      logger.error(err);
      throw new ServicesError();
    }
  }

  public async decrementCv(userId: number): Promise<void> {
    try {
      const recentRecord = await ScoreModel.query()
        .where({ userId })
        .andWhere('cv', '>=', 1)
        .orderBy([
          { column: 'year', order: 'desc' },
          { column: 'month', order: 'desc' },
          { column: 'day', order: 'desc' },
        ])
        .first();

      if (!recentRecord) {
        return;
      }

      await ScoreModel.query()
        .patch({
          cv: ScoreModel.raw('?? - ?', ['scores.cv', 1]),
        })
        .where({ userId, year: recentRecord.year, month: recentRecord.month, day: recentRecord.day });
    } catch (err) {
      logger.error(err);
      throw new ServicesError();
    }
  }

  public async getTotalMonthValues(userId: number, column: scoreColumn | 'searchAndCv'): Promise<number> {
    try {
      const { startDate, endDate } = this.getDateRangeQuery();
      return await ScoreModel.query()
        .where({ userId })
        .whereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') >= ?`, [startDate])
        .andWhereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') <= ?`, [endDate])
        .modify(qb => {
          column === 'searchAndCv' ? qb.select(ScoreModel.raw('SUM(searches + cv) as count')) : qb.sum(`${column} as count`);
        })
        .then(([{ count }]) => count);
    } catch (err) {
      logger.error(err);
      throw new ServicesError(err.message || 'Error calculating total searches.');
    }
  }

  public async getUserCurrentScores(userId: number): Promise<{ currentScore: ScoreModel[]; prevScores: { searches: number; profiles: number } }> {
    try {
      const date = this.currentDate;
      const { year, month } = this.extractDate(date);
      date.setMonth(date.getMonth() - 1);
      if (date.getMonth() === this.currentDate.getMonth()) {
        date.setDate(0);
      }
      const { year: prevYear, month: prevMonth } = this.extractDate(date);

      return await ScoreModel.query()
        .select('searches', 'profils', 'year', 'month', 'day')
        .where({ userId })
        .andWhere(builder => {
          builder
            .where(qb => {
              qb.where({ year, month });
            })
            .orWhere(qb => {
              qb.where({ year: prevYear, month: prevMonth });
            });
        })
        .orderBy('id', 'asc')
        .then(data => {
          const currentScore = data.filter(item => item.year === year && item.month === month);
          const lastMonthData = data.filter(item => item.year === prevYear && item.month === prevMonth);
          const searches = lastMonthData.reduce((sum, item) => sum + item.searches, 0) || 0;
          const profiles = lastMonthData.reduce((sum, item) => sum + item.profils, 0) || 0;

          return {
            currentScore,
            prevScores: {
              searches,
              profiles,
            },
          };
        });
    } catch (err) {
      throw new ServicesError();
    }
  }

  public async getUserRangeScores(startDateProps: Date, endDateProps: Date, userId: number): Promise<ScoreModel[]> {
    try {
      const { year: startYear, month: startMonth, day: startDay } = this.extractDate(startDateProps);
      const { year: endYear, month: endMonth, day: endDay } = this.extractDate(endDateProps);

      const startDate = `${startYear}-${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`;
      const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${endDay.toString().padStart(2, '0')}`;

      return await ScoreModel.query()
        .where({ userId })
        .whereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') >= ?`, [startDate])
        .andWhereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') <= ?`, [endDate])
        .select('searches', 'profils', 'year', 'month', 'day')
        .orderBy('id', 'asc');
    } catch (err) {
      console.log(err);
      throw new ServicesError();
    }
  }
}

export default ScoreServiceFile;
