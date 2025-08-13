import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "perkIconUrl"
})
export class PerkIconUrlPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}