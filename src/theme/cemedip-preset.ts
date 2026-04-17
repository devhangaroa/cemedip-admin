import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const CemedipPreset = definePreset(Aura, {
  primitive: {
    brandpurple: {
      50:  '#F7F1F7',
      100: '#EDDEED',
      200: '#DFC5E0',
      300: '#CDA4CE',
      400: '#B477B6',
      500: '#9B479D',
      600: '#88418A',
      700: '#763877',
      800: '#602E61',
      900: '#4A244B',
      950: '#321832',
    },
    // Secundario — teal #0DADA9
    brandteal: {
      50:  '#E6F9F9',
      100: '#C0F1EF',
      200: '#8DE5E2',
      300: '#51D4D0',
      400: '#29BFBB',
      500: '#0DADA9',
      600: '#0B9995',
      700: '#098581',
      800: '#076C69',
      900: '#055452',
      950: '#033836',
    },
    // Éxito — green #188553
    brandgreen: {
      50:  '#E8F5ED',
      100: '#C5E8D5',
      200: '#96D6B3',
      300: '#5DBF89',
      400: '#34A669',
      500: '#188553',
      600: '#147548',
      700: '#11633D',
      800: '#0D5031',
      900: '#093D25',
      950: '#062818',
    },
    // Danger — #DB3545
    branddanger: {
      50:  '#FDE8EA',
      100: '#FAC5CA',
      200: '#F799A1',
      300: '#F36670',
      400: '#EF3F50',
      500: '#DB3545',
      600: '#C12E3C',
      700: '#A42633',
      800: '#87202A',
      900: '#6A1921',
      950: '#450F15',
    },
    // Terciario — neutral #B8B8B8 en 400
    brandneutral: {
      50:  '#F5F5F5',
      100: '#EBEBEB',
      200: '#DEDEDE',
      300: '#CECECE',
      400: '#B8B8B8',
      500: '#9E9E9E',
      600: '#858585',
      700: '#6C6C6C',
      800: '#545454',
      900: '#3D3D3D',
      950: '#282828',
    },
    brandslate: {
      50:  '#F2F4F5',
      100: '#E2E5E8',
      200: '#CCD2D6',
      300: '#AFB8C0',
      400: '#8794A0',
      500: '#5F7180',
      600: '#546371',
      700: '#485661',
      800: '#3B464F',
      900: '#2E363D',
      950: '#1E2429',
    },
  },

  semantic: {
    primary: {
      50:  '{brandpurple.50}',
      100: '{brandpurple.100}',
      200: '{brandpurple.200}',
      300: '{brandpurple.300}',
      400: '{brandpurple.400}',
      500: '{brandpurple.500}',
      600: '{brandpurple.600}',
      700: '{brandpurple.700}',
      800: '{brandpurple.800}',
      900: '{brandpurple.900}',
      950: '{brandpurple.950}',
    },

    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.400}',
      offset: '1px',
    },

    colorScheme: {
      light: {
        surface: {
          0:   '#FFFFFF',
          50:  '#EAEDF4', // fondo de app — gris azulado
          100: '#F6F7F8',
          200: '#EDEDED', // fondo de inputs
          300: '#E2E5E8',
          400: '#CCD2D6',
          500: '#AFB8C0',
          600: '#8794A0',
          700: '#5F7180',
          800: '#485661',
          900: '#2E363D',
          950: '#1E2429',
        },
        primary: {
          color:        '{brandpurple.500}',
          inverseColor: '#FFFFFF',
          hoverColor:   '{brandpurple.600}',
          activeColor:  '{brandpurple.700}',
        },
        secondary: {
          color:        '{brandteal.500}',
          inverseColor: '#FFFFFF',
          hoverColor:   '{brandteal.600}',
          activeColor:  '{brandteal.700}',
        },
        success: {
          color:        '{brandgreen.500}',
          inverseColor: '#FFFFFF',
          hoverColor:   '{brandgreen.600}',
          activeColor:  '{brandgreen.700}',
        },
        warn: {
          color:        '{branddanger.500}',
          inverseColor: '#FFFFFF',
          hoverColor:   '{branddanger.600}',
          activeColor:  '{branddanger.700}',
        },
        highlight: {
          background:      '{brandteal.50}',
          focusBackground: '{brandteal.100}',
          color:           '{brandteal.700}',
          focusColor:      '{brandteal.800}',
        },
        formField: {
          filledBackground:      '{surface.200}',
          filledHoverBackground: '{surface.300}',
          filledFocusBackground: '{surface.200}',
          hoverBorderColor:      '{brandpurple.500}',
        },
      },

      dark: {
        surface: {
          0:   '#111827',
          50:  '#1E2429',
          100: '#2E363D',
          200: '#3B464F',
          300: '#485661',
          400: '#5F7180',
          500: '#8794A0',
          600: '#AFB8C0',
          700: '#CCD2D6',
          800: '#E2E5E8',
          900: '#F6F7F8',
          950: '#FFFFFF',
        },
        primary: {
          color:        '{brandpurple.300}',
          inverseColor: '{brandslate.950}',
          hoverColor:   '{brandpurple.200}',
          activeColor:  '{brandpurple.100}',
        },
        secondary: {
          color:        '{brandteal.300}',
          inverseColor: '{brandslate.950}',
          hoverColor:   '{brandteal.200}',
          activeColor:  '{brandteal.100}',
        },
        success: {
          color:        '{brandgreen.300}',
          inverseColor: '{brandslate.950}',
          hoverColor:   '{brandgreen.200}',
          activeColor:  '{brandgreen.100}',
        },
        warn: {
          color:        '{branddanger.300}',
          inverseColor: '{brandslate.950}',
          hoverColor:   '{branddanger.200}',
          activeColor:  '{branddanger.100}',
        },
        highlight: {
          background:      'rgba(13, 173, 169, 0.18)',
          focusBackground: 'rgba(13, 173, 169, 0.28)',
          color:           '{brandteal.100}',
          focusColor:      '{brandteal.50}',
        },
        formField: {
          hoverBorderColor: '{brandpurple.300}',
        },
      },
    },
  },

  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            secondary: {
              background:        '{brandteal.500}',
              hoverBackground:   '{brandteal.600}',
              activeBackground:  '{brandteal.700}',
              borderColor:       '{brandteal.500}',
              hoverBorderColor:  '{brandteal.600}',
              activeBorderColor: '{brandteal.700}',
              color:             '#ffffff',
              hoverColor:        '#ffffff',
              activeColor:       '#ffffff',
            },
          },
        },
        dark: {
          root: {
            secondary: {
              background:        '{brandteal.400}',
              hoverBackground:   '{brandteal.300}',
              activeBackground:  '{brandteal.200}',
              borderColor:       '{brandteal.400}',
              hoverBorderColor:  '{brandteal.300}',
              activeBorderColor: '{brandteal.200}',
              color:             '#ffffff',
              hoverColor:        '#ffffff',
              activeColor:       '#ffffff',
            },
          },
        },
      },
    },
    progressbar: {
      value: {
        background: '{success.color}',
      },
    },
  },
});

export default CemedipPreset;
