import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  #path = 'http://localhost:8080/api/images';

  getImageUrl(id: number) {
    return `${this.#path}/${id}`;
  }
}
