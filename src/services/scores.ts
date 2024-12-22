import { ServicesError } from '@/exceptions';
import { ScoreModel } from '@/models/pg/scores';
import { logger } from '@/utils/logger';
import { Service } from 'typedi';
@Service()
class ScoreServiceFile {
  public get currentDate(): Date {
    return new Date();
  }
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
  public async improveScore(columns: Exclude<scoreColumn, 'searchAndCv'>[], count: number, userId: number): Promise<ScoreModel> {
    try {
      const { year, month, day } = this.extractDate(this.currentDate);
      const insertData: any = {
        userId,
        year,
        month,
        day,
      };
      columns.forEach(column => {
        insertData[column] = count;
      });

      const mergeData: any = {};
      columns.forEach(column => {
        mergeData[column] = ScoreModel.raw('?? + ?', [`scores.${column}`, count]);
      });

      return await ScoreModel.query().insert(insertData).onConflict(['userId', 'year', 'month', 'day']).merge(mergeData);
    } catch (error) {
      logger.error('ScoreService.improveScore => ', error);
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
    } catch (error) {
      logger.error('ScoreService.decrementCv => ', error);
      throw new ServicesError();
    }
  }

  public async getTotalMonthValues(userId: number, columns: scoreColumn[]): Promise<Partial<Record<scoreColumn, number>>> {
    try {
      const { startDate, endDate } = this.getDateRangeQuery();
      return await ScoreModel.query()
        .where({ userId })
        .whereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') >= ?`, [startDate])
        .andWhereRaw(`TO_DATE(CONCAT(year, '-', month, '-', day), 'YYYY-MM-DD') <= ?`, [endDate])
        .modify(qb => {
          columns.forEach(column => {
            if (column === 'searchAndCv') {
              qb.select(ScoreModel.raw('SUM(searches + cv) as searchAndCv'));
            } else {
              qb.sum(`${column} as ${column}`);
            }
          });
        })
        .first()
        .then(result => {
          return columns.reduce((acc, column) => {
            return { ...acc, [column]: Number.parseInt(String(result[column])) || 0 };
          }, {}) as Partial<Record<scoreColumn, number>>;
        });
    } catch (error) {
      logger.error('ScoreService.getTotalMonthValues => ', error);
      throw new ServicesError();
    }
  }

  public async getUserCurrentScores(userId: number): Promise<{
    currentScore: ScoreModel[];
    lastScores: { totalSearches: number; totalProfiles: number };
    totalCurrentSearches: number;
    totalCurrentProfiles: number;
  }> {
    try {
      const date = new Date();
      const currentDate = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      };
      date.setMonth(date.getMonth() - 1);
      const prevYear = date.getFullYear();
      const prevMonth = date.getMonth() + 1;

      return await ScoreModel.query()
        .select('searches', 'profils', 'year', 'month', 'day')
        .where({ userId })
        .andWhere(builder => {
          builder
            .where(qb => {
              qb.where({ year: currentDate.year, month: currentDate.month });
            })
            .orWhere(qb => {
              qb.where({ year: prevYear, month: prevMonth });
            });
        })
        .orderBy('id', 'asc')
        .then(data => {
          const currentScore = data.filter(item => item.year === currentDate.year && item.month === currentDate.month);
          const lastMonthData = data.filter(item => item.year === prevYear && item.month === prevMonth);
          const totalSearches = lastMonthData.reduce((sum, item) => sum + item.searches, 0) || 0;
          const totalProfiles = lastMonthData.reduce((sum, item) => sum + item.profils, 0) || 0;
          const totalCurrentSearches = currentScore.reduce((sum, item) => sum + item.searches, 0) || 0;
          const totalCurrentProfiles = currentScore.reduce((sum, item) => sum + item.profils, 0) || 0;
          const lastScores = {
            totalSearches,
            totalProfiles,
          };
          return {
            totalCurrentSearches,
            totalCurrentProfiles,
            currentScore,
            lastScores,
          };
        });
    } catch (error) {
      logger.error('ScoreService.getUserCurrentScores => ', error);
      throw new ServicesError();
    }
  }

  public async getUserRangeScores(
    startDateProps: Date,
    endDateProps: Date,
    userId: number,
  ): Promise<{ scores: ScoreModel[]; totalSearches: number; totalProfiles: number }> {
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
        .orderBy('id', 'asc')
        .then(data => {
          const totalSearches = data.reduce((sum, item) => sum + item.searches, 0) || 0;
          const totalProfiles = data.reduce((sum, item) => sum + item.profils, 0) || 0;
          return {
            scores: data,
            totalSearches,
            totalProfiles,
          };
        });
    } catch (error) {
      logger.error('ScoreService.getUserRangeScores => ', error);
      throw new ServicesError();
    }
  }
}

export default ScoreServiceFile;
