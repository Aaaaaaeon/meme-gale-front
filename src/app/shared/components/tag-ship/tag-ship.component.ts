import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tag } from '../../interfaces/tag.interface';

@Component({
  selector: 'app-tag-chip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge badge-primary badge-md">
      {{ tag.name }}
    </span>
  `
})
export class TagChipComponent {
  @Input() tag!: Tag;
}
