import {inject, Pipe, PipeTransform} from "@angular/core";
import {ImageService} from '../../core/services/image.service';

@Pipe({
    name: "imageUrl"
})
export class ImageUrlPipe implements PipeTransform {
    #imageService = inject(ImageService);

    transform(id: number): string {
      if (!id) return '';
      return this.#imageService.getImageUrl(id);
  }
}
