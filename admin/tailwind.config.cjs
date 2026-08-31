/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./resources/views/**/*.blade.php', './resources/js/**/*.{js,ts,jsx,tsx}', './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'sans-serif'],
                serif: ['Zaloga', 'serif'],
            },
        },
    },
    plugins: [],
};
