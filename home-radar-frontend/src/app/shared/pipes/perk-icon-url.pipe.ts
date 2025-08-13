import { Pipe, PipeTransform } from "@angular/core";
import { getPerkIconUrl } from "../utils/perk-icon-url.util";

@Pipe({
    name: "perkIconUrl"
})
export class PerkIconUrlPipe implements PipeTransform {  
    transform(value: string): string {
    if (!value) return '';
    return getPerkIconUrl(value);
  }
}