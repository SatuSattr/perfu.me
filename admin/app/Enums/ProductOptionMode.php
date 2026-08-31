<?php

namespace App\Enums;

enum ProductOptionMode: string
{
    case Dropdown = 'dropdown';
    case Normal = 'normal';

    public function label(): string
    {
        return match ($this) {
            self::Dropdown => 'Dropdown',
            self::Normal => 'Choice Group',
        };
    }

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
