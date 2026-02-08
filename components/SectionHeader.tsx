import React from 'react'
import SectionBadge from './SectionBadge'

interface SectionHeaderProps {
    title: string
    description: string
    buttonText?: string
    onButtonClick?: () => void
}

export default function SectionHeader({
    title,
    description,
    buttonText,
    onButtonClick,
}: SectionHeaderProps) {
    return (
        <div className="flex justify-between items-end mb-12">
            <div>
                <SectionBadge />
                <h2 className="text-4xl font-bold mb-4">{title}</h2>
                <p className="text-gray-400 max-w-2xl">{description}</p>
            </div>
            {buttonText && (
                <button
                    onClick={onButtonClick}
                    className="hidden md:block px-6 py-3 border border-border-dark bg-card-dark rounded-xl text-sm font-medium hover:bg-white/5"
                >
                    {buttonText}
                </button>
            )}
        </div>
    )
}
