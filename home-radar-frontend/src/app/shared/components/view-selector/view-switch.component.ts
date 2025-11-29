import {Component, inject, input, output} from '@angular/core';
import {NgClass} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {ViewTypeEnum} from '../../../enums/view-type.enum';
import {Router} from '@angular/router';
import {CapitalizePipe} from '../../pipes/capitilzie.pipe';

@Component({
  selector: 'view-switch',
  templateUrl: './view-switch.component.html',
  styleUrls: ['./view-switch.component.scss'],
  imports: [
    MatIcon,
    NgClass,
    CapitalizePipe
  ],
})
export class ViewSwitchComponent {
  viewType = input<ViewTypeEnum>(ViewTypeEnum.MAP_VIEW);
  onViewSwitch = output<ViewTypeEnum>();

  #router = inject(Router);

  handleViewSwitch(viewType: ViewTypeEnum) {
    this.#router.navigate([], {
      queryParams: {
        viewType: viewType || null
      },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.onViewSwitch.emit(viewType);
    });
  }

  protected readonly ViewTypeEnum = ViewTypeEnum;
}
