import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MemeService } from '../../services/meme.service';

interface SearchResult {
  id: string;
  title: string;
  image: string;
}

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="relative">
      <!-- Search Input -->
      <div class="relative">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input 
          type="text"
          [(ngModel)]="searchQuery"
          (input)="onSearchInput()"
          (focus)="showResults = true"
          (blur)="onBlur()"
          placeholder="Rechercher des mèmes..."
          class="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        @if (loading) {
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <div class="spinner w-4 h-4"></div>
          </div>
        }
      </div>

      <!-- Search Results Dropdown -->
      @if (showResults && (results.length > 0 || searchQuery.length > 2)) {
        <div class="absolute top-full left-0 right-0 mt-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          @if (results.length > 0) {
            @for (result of results; track result.id) {
              <a 
                [routerLink]="['/meme', result.id]"
                class="flex items-center gap-3 p-3 hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
                (click)="selectResult(result)">
                <img [src]="memeService.getImageUrl(result.image)" 
                     [alt]="result.title"
                     class="w-12 h-12 object-cover rounded-lg">
                <span class="text-sm font-medium text-[var(--color-text)] line-clamp-2">{{ result.title }}</span>
              </a>
            }
          } @else if (searchQuery.length > 2 && !loading) {
            <div class="p-4 text-center text-gray-500 text-sm">
              Aucun résultat pour "{{ searchQuery }}"
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }
  `]
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchQuery = '';
  results: SearchResult[] = [];
  loading = false;
  showResults = false;
  
  private searchSubject = new Subject<string>();

  constructor(
    public memeService: MemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) {
          return of([]);
        }
        this.loading = true;
        
        // Use Directus native search with _icontains filter
        // Falls back to this if Meilisearch is not available
        return this.memeService.getMemes({
          filter: {
            title: { _icontains: query }
          },
          limit: 10
        });
      })
    ).subscribe({
      next: (response: any) => {
        // Handle both Meilisearch response format and Directus array
        this.results = Array.isArray(response) ? response : (response?.hits || response?.data || []);
        this.loading = false;
      },
      error: () => {
        this.results = [];
        this.loading = false;
      }
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  selectResult(result: SearchResult): void {
    this.showResults = false;
    this.searchQuery = '';
  }

  onBlur(): void {
    // Delay to allow click on result
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}
