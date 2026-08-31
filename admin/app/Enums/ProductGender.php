<?php

namespace App\Enums;

enum ProductGender: string
{
    case Pria = 'Pria';
    case Wanita = 'Wanita';
    case Unisex = 'Unisex';

    public function label(): string
    {
        return $this->value;
    }

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
