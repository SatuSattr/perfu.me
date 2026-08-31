<?php

namespace App\Enums;

enum ProductCategory: string
{
    case EDP = 'EDP';

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
