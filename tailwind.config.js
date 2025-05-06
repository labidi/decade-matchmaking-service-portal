import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'firefly': {
                    '50': '#f1fafa',
                    '100': '#dbf1f2',
                    '200': '#bbe4e6',
                    '300': '#8bcfd5',
                    '400': '#55b2bb',
                    '500': '#3996a1',
                    '600': '#327b88',
                    '700': '#2e6570',
                    '800': '#2d545d',
                    '900': '#294750',
                    '950': '#19323a',
                },
                'bright-turquoise': {
                    '50': '#eefffc',
                    '100': '#c6fff6',
                    '200': '#8effef',
                    '300': '#4dfbe7',
                    '400': '#19e8d6',
                    '500': '#00e2d2',
                    '600': '#00a49c',
                    '700': '#02837e',
                    '800': '#086765',
                    '900': '#0c5553',
                    '950': '#003334',
                },
                'neon-carrot': {
                    '50': '#fff7ed',
                    '100': '#ffedd5',
                    '200': '#fed8aa',
                    '300': '#fcbc75',
                    '400': '#fa9137',
                    '500': '#f87617',
                    '600': '#e95a0d',
                    '700': '#c1430d',
                    '800': '#993613',
                    '900': '#7c2e12',
                    '950': '#431507',
                },
                'casal': {
                    '50': '#e9fffd',
                    '100': '#c7fff9',
                    '200': '#96fff4',
                    '300': '#4efff0',
                    '400': '#00fff6',
                    '500': '#00e9f8',
                    '600': '#00b9cf',
                    '700': '#0093a7',
                    '800': '#047586',
                    '900': '#085868',
                    '950': '#00404e',
                },
                'wild-sand': {
                    '50': '#f5f5f5',
                    '100': '#efefef',
                    '200': '#dcdcdc',
                    '300': '#bdbdbd',
                    '400': '#989898',
                    '500': '#7c7c7c',
                    '600': '#656565',
                    '700': '#525252',
                    '800': '#464646',
                    '900': '#3d3d3d',
                    '950': '#292929',
                },
                'firefly-6': {
                    '50': '#f1fafa',
                    '100': '#dbf1f2',
                    '200': '#bbe4e6',
                    '300': '#8bcfd5',
                    '400': '#55b2bb',
                    '500': '#3996a1',
                    '600': '#327b88',
                    '700': '#2e6570',
                    '800': '#2d545d',
                    '900': '#294750',
                    '950': '#19323a',
                },
            }
        },
    },

    plugins: [forms],
};
