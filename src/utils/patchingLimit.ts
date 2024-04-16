import { totalFavorisSave, totalSearchSave } from '@/config/access';
import { User } from '@/interfaces/models';
import FavorisServiceFile from '@/services/favoris';
import SearchesServiceFile from '@/services/searches';
import Container from 'typedi';

class PatchLimit {
  private user: User;
  private FavorisServices: FavorisServiceFile;
  private SearchServices: SearchesServiceFile;

  constructor(user: User) {
    this.user = user;
    this.FavorisServices = Container.get(FavorisServiceFile);
    this.SearchServices = Container.get(SearchesServiceFile);
    const { role } = this.user;

    if (['admin', 'business'].includes(role)) {
      this.fullAccess();
      return;
    }
    if (role === 'pro') {
      this.proLimit();
      return;
    }
    if (role === 'free') {
      this.freeLimit();
      return;
    }
  }

  fullAccess() {
    this.FavorisServices.lockFavoris(this.user.id, totalFavorisSave.business);
    this.SearchServices.lockSearches(this.user.id, totalSearchSave.business);
  }
  proLimit() {
    this.FavorisServices.lockFavoris(this.user.id, totalFavorisSave.pro);
    this.SearchServices.lockSearches(this.user.id, totalSearchSave.pro);
  }
  freeLimit() {
    this.FavorisServices.lockFavoris(this.user.id, totalFavorisSave.free);
    this.SearchServices.lockSearches(this.user.id, totalSearchSave.pro);
  }
}

export default PatchLimit;
