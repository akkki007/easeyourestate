import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onNext?: () => void
    onPrev?: () => void
}

export default function Pagination({
    currentPage,
    totalPages,
    onNext,
    onPrev,
}: PaginationProps) {
    return (
        <div className="mt-12 pt-12 border-t border-border flex items-center justify-center md:justify-between">
            <span className="text-sm font-medium">
                {String(currentPage).padStart(2, '0')}{' '}
                <span className="text-tertiary">of {totalPages}</span>
            </span>
            <div className="flex gap-4">
                <button
                    onClick={onPrev}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-secondary hover:bg-hover transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button
                    onClick={onNext}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-secondary hover:bg-hover transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
        </div>
    )
}
