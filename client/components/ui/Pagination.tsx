'use client';

import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
  itemLabel?: string;
  className?: string;
  siblingCount?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [6, 12, 24, 48],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  showInfo = true,
  showPageSizeSelector = true,
  itemLabel = 'results',
  className = '',
  siblingCount = 1,
}: PaginationProps) {
  // If there's only 1 page and no items, or totalPages <= 0, hide or show minimal
  const safeTotalPages = Math.max(totalPages || 1, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage || 1, 1), safeTotalPages);

  // Compute start and end indices for display info
  const startItem = totalItems !== undefined && pageSize
    ? totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1
    : undefined;
  const endItem = totalItems !== undefined && pageSize
    ? Math.min(safeCurrentPage * pageSize, totalItems)
    : undefined;

  // Generate page numbers with smart ellipsis
  const paginationRange = useMemo<(number | 'ellipsis')[]>(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount + first + last + current + 2*ellipsis

    if (totalPageNumbers >= safeTotalPages) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(safeCurrentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(safeCurrentPage + siblingCount, safeTotalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < safeTotalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = safeTotalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'ellipsis', safeTotalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => safeTotalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, 'ellipsis', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, 'ellipsis', ...middleRange, 'ellipsis', lastPageIndex];
    }

    return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
  }, [safeTotalPages, siblingCount, safeCurrentPage]);

  const handlePageClick = (page: number) => {
    if (page === safeCurrentPage || isLoading) return;
    if (page >= 1 && page <= safeTotalPages) {
      onPageChange(page);
    }
  };

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-3 sm:px-4 bg-white border border-[#e2e8f0] rounded-2xl shadow-2xs ${className}`}
    >
      {/* 1. Results Info & Loading Indicator */}
      <div className="flex items-center gap-2 text-xs text-[#64748b] order-2 sm:order-1">
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0051d5]" />
        )}
        {showInfo && totalItems !== undefined && (
          <p>
            Showing{' '}
            <span className="font-semibold text-[#091426]">{startItem}</span>
            {' '}-{' '}
            <span className="font-semibold text-[#091426]">{endItem}</span>
            {' '}of{' '}
            <span className="font-semibold text-[#091426]">{totalItems}</span>
            {' '}{itemLabel}
          </p>
        )}
      </div>

      {/* 2. Controls: Page Size Selector + Page Numbers */}
      <div className="flex flex-wrap items-center justify-center gap-2 order-1 sm:order-2 w-full sm:w-auto">
        {/* Page size dropdown */}
        {showPageSizeSelector && onPageSizeChange && pageSize && (
          <div className="flex items-center gap-1.5 mr-2">
            <span className="text-[11px] font-medium text-[#64748b] hidden md:inline">
              Per page:
            </span>
            <select
              value={pageSize}
              disabled={isLoading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="px-2 py-1.5 text-xs font-semibold text-[#091426] bg-[#f8f9ff] border border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#0051d5] cursor-pointer transition-colors disabled:opacity-50"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}

        {/* First Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          title="First page"
          aria-label="Go to first page"
          className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#091426] hover:bg-[#f8f9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageClick(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1 || isLoading}
          title="Previous page"
          aria-label="Go to previous page"
          className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#091426] hover:bg-[#f8f9ff] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {paginationRange.map((pageNumber, idx) => {
            if (pageNumber === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-[#94a3b8] select-none"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = pageNumber === safeCurrentPage;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => handlePageClick(pageNumber)}
                disabled={isLoading}
                aria-current={isCurrent ? 'page' : undefined}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#0051d5] text-white shadow-xs pointer-events-none'
                    : 'text-[#475569] border border-[#e2e8f0] hover:bg-[#f8f9ff] hover:text-[#091426]'
                } disabled:opacity-50`}
              >
                {pageNumber}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageClick(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          title="Next page"
          aria-label="Go to next page"
          className="px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#64748b] hover:text-[#091426] hover:bg-[#f8f9ff] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(safeTotalPages)}
          disabled={safeCurrentPage >= safeTotalPages || isLoading}
          title="Last page"
          aria-label="Go to last page"
          className="p-1.5 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:text-[#091426] hover:bg-[#f8f9ff] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
