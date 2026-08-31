<?php

namespace App\Enums;

enum ProductType: string
{
    case Signature = 'signature';
    case Inspired = 'inspired';

    public function label(): string
    {
        return match ($this) {
            self::Signature => 'Signature',
            self::Inspired => 'Inspired Scent',
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
