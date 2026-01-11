import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-card">
      <!-- Image placeholder -->
      <div class="aspect-square skeleton"></div>
      
      <!-- Content -->
      <div class="p-4 space-y-3">
        <!-- Title -->
        <div class="skeleton skeleton-text"></div>
        
        <!-- Tags -->
        <div class="flex gap-2">
          <div class="skeleton h-6 w-16 rounded-md"></div>
          <div class="skeleton h-6 w-12 rounded-md"></div>
        </div>
        
        <!-- Footer -->
        <div class="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
          <div class="flex items-center gap-2">
            <div class="skeleton skeleton-avatar"></div>
            <div class="skeleton skeleton-text-sm w-20"></div>
          </div>
          <div class="flex gap-2">
            <div class="skeleton h-4 w-8 rounded"></div>
            <div class="skeleton h-4 w-8 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SkeletonCardComponent {}
