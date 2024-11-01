import { ROLE_FAVORIS_SAVE_LIMIT, ROLE_SEARCH_SAVE_LIMIT } from '@/config/access';
import { UserSchema } from '@/interfaces/models';
import FavorisServiceFile from '@/services/favoris';
import SearchesServiceFile from '@/services/searches';
import Container from 'typedi';

class PatchLimit {
  private user: UserSchema;
  private FavorisServices: FavorisServiceFile;
  private SearchServices: SearchesServiceFile;

  constructor(user: UserSchema) {
    this.user = user;
    this.FavorisServices = Container.get(FavorisServiceFile);
    this.SearchServices = Container.get(SearchesServiceFile);
    const { role } = this.user;

    if ('business'.includes(role)) {
      this.businessAccess();
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

  businessAccess() {
    this.FavorisServices.lockIn(this.user.id, ROLE_FAVORIS_SAVE_LIMIT.business);
    this.SearchServices.lockIn(this.user.id, ROLE_SEARCH_SAVE_LIMIT.business);
  }
  proLimit() {
    this.FavorisServices.lockIn(this.user.id, ROLE_FAVORIS_SAVE_LIMIT.pro);
    this.SearchServices.lockIn(this.user.id, ROLE_SEARCH_SAVE_LIMIT.pro);
  }
  freeLimit() {
    this.FavorisServices.lockIn(this.user.id, ROLE_FAVORIS_SAVE_LIMIT.free);
    this.SearchServices.lockIn(this.user.id, ROLE_SEARCH_SAVE_LIMIT.pro);
  }
}

export default PatchLimit;
