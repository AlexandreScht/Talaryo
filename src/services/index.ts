import AxiosInstance from '@/app/api/axios';
// import { trainingIAService } from './admin';
import {
  activate2FAService,
  askCodeService,
  askNewPasswordService,
  loginService,
  oAuthService,
  registerService,
  resetPasswordService,
  validateAccountService,
  verify2FAService,
} from './auth';
import { createFavFolderService, getFavFoldersService, removeFavFolderService } from './favFolders';
import { createFavorisService, getFavorisService, removeFavorisService, updateFavorisService } from './favoris';
import { localizationService } from './localisation';
import { AddingScoreService, GetTotalUserScoreService, GetUserScoreService } from './scores';
import { cvContentService, scrappingCVService, scrappingPersonalDataService, scrappingSearchService } from './scrapping';
import { createSearchFolderService, getSearchFoldersService, removeSearchFolderService } from './searchFolders';
import { createSearchService, getSearchesService, removeSearchService } from './searches';
import { cancelSubscribeService, createSubscribeService, getInvoicesService, getSubscribeService, updateSubscribeService } from './subscribe';
import { UpdateUserService, getAllUsersService } from './users';

const PrepareServices = ({
  token,
}: {
  token?: string | undefined;
} = {}) => {
  const axios = AxiosInstance({ token });
  return {
    //* admin
    // trainingIA: trainingIAService({ axios }),
    // * authenticate
    register: registerService({ axios }),
    oAuth: oAuthService({ axios }),
    login: loginService({ axios }),
    askCode: askCodeService({ axios }),
    validateAccount: validateAccountService({ axios }),
    verify2FA: verify2FAService({ axios }),
    activate2FA: activate2FAService({ axios }),
    askNewPassword: askNewPasswordService({ axios }),
    resetPassword: resetPasswordService({ axios }),
    // * users
    // updateCurrentUser: UpdateCurrentUserService({ axios }),
    updateUsers: UpdateUserService({ axios }),
    getAllUsers: getAllUsersService({ axios }),
    // * subscribe
    getSubscribe: getSubscribeService({ axios }),
    cancellationSub: cancelSubscribeService({ axios }),
    updateSubscribe: updateSubscribeService({ axios }),
    createSubscribe: createSubscribeService({ axios }),
    getInvoices: getInvoicesService({ axios }),
    // * scores
    addingScore: AddingScoreService({ axios }),
    getUserScore: GetUserScoreService({ axios }),
    // getUserAmountScore: GetUserAmountScoreService({ axios }),
    GetTotalUserScore: GetTotalUserScoreService({ axios }),
    // * favoris
    addFavori: createFavorisService({ axios }),
    updateFav: updateFavorisService({ axios }),
    removeFavori: removeFavorisService({ axios }),
    getFavoris: getFavorisService({ axios }),
    // getLastFavoris: getLastFavorisService({ axios }),
    // * FavFolders
    addFavFolder: createFavFolderService({ axios }),
    getFavFolders: getFavFoldersService({ axios }),
    removeFavFolder: removeFavFolderService({ axios }),
    // * SearchFolders
    addSearchFolder: createSearchFolderService({ axios }),
    getSearchFolder: getSearchFoldersService({ axios }),
    removeSearchFolder: removeSearchFolderService({ axios }),
    // * Searches
    addSearch: createSearchService({ axios }),
    removeSearch: removeSearchService({ axios }),
    getSearches: getSearchesService({ axios }),
    // getTotalSearches: getTotalSearchesService({ axios }),
    // * scrapping
    scrappingSearch: scrappingSearchService({ axios }),
    scrappingCV: scrappingCVService({ axios }),
    scrappingEmail: scrappingPersonalDataService({ axios }),
    cvContent: cvContentService({ axios }),
    // * apiCallback
    localisation: localizationService(),
  };
};

export default PrepareServices;
