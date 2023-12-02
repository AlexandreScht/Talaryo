// import auth from '@/middlewares/auth';
// import FavorisFolderFile from '@/services/favFolders';
// import FavorisServiceFile from '@/services/favoris';
// import { idValidator, limitValidator, pageValidator, stringValidator } from '@libs/validate';
// import mw from '@middlewares/mw';
// import validator from '@middlewares/validator';
// import Container from 'typedi';

// const FavorisController = ({ app }) => {
//   const FavorisServices = Container.get(FavorisServiceFile);
//   const FavorisFolderServices = Container.get(FavorisFolderFile);
//   app.post(
//     '/create-search',
//     mw([
//       auth(),
//       validator({
//         body: {
//           searchQueries: stringValidator.required(),
//           searchFolderId: idValidator.required(),
//         },
//       }),
//       async ({
//         locals: {
//           body: { searchQueries },
//         },
//         session: { sessionId },
//         res,
//         next,
//       }) => {
//         try {
//           const success = await FavorisServices.createFav({ searchFolderId, searchQueries }, sessionId);
//           res.send({ res: success });
//         } catch (error) {
//           next(error);
//         }
//       },
//     ]),
//   );
//   app.delete(
//     '/remove-search',
//     mw([
//       auth(),
//       validator({
//         query: {
//           id: idValidator.required(),
//         },
//       }),
//       async ({
//         locals: {
//           query: { id },
//         },
//         res,
//         next,
//       }) => {
//         try {
//           const success = await FavorisServices.removeFav({ id });
//           res.send({ res: success });
//         } catch (error) {
//           next(error);
//         }
//       },
//     ]),
//   );
//   app.get(
//     '/get-searches',
//     mw([
//       auth(),
//       validator({
//         query: {
//           limit: limitValidator.default(10),
//           page: pageValidator.default(1),
//           searchFolderName: stringValidator.required(),
//         },
//       }),
//       async ({
//         locals: {
//           query: { limit, page, searchFolderName },
//         },
//         session: { sessionId },
//         res,
//         next,
//       }) => {
//         try {
//           const favFolderModel = await FavorisFolderServices.getFolderByName(searchFolderName, sessionId);

//           const { favoris, total } = await FavorisServices.getFavInFolder(limit, page, favFolderModel.id);

//           res.send({ res: { list: favoris, meta: { total } } });
//         } catch (error) {
//           next(error);
//         }
//       },
//     ]),
//   );
//   app.get(
//     '/get-lastSearches',
//     mw([
//       auth(),
//       async ({ session: { sessionId }, res, next }) => {
//         try {
//           const favoris = await FavorisServices.getLastFav(sessionId);

//           res.send({ res: favoris });
//         } catch (error) {
//           next(error);
//         }
//       },
//     ]),
//   );
// };
// export default FavorisController;
