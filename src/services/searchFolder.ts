// import { ServerException } from '@/exceptions';
// import { favorisData } from '@/interfaces/favoris';
// import { FavoriModel } from '@models/favoris';
// import type { Knex } from 'knex';
// import { Service } from 'typedi';

// @Service()
// class SearchFolderFile {
//   get getModel(): Knex<any, any[]> {
//     return FavoriModel.knex();
//   }

//   public async findAllUserFav(id: number): Promise<string[]> {
//     const findUser: FavoriModel[] = await FavoriModel.query().where({ userId: id }).select('link');
//     return findUser.map(v => v.link);
//   }
// }

// export default SearchFolderFile;
