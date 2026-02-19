export default defineAppConfig({
  ui: {
    button: {
      variants: {
        variant: {
          elevated: 'elevated'
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: 'elevated',
          class: 'bg-primary'
        },
        {
          color: 'secondary',
          variant: 'elevated',
          class: 'bg-secondary'
        },
      ],
      defaultVariants: {
        variant: 'solid'
      }
    },
    modal: {
      variants: {
        overlay: {
          true: {
            overlay: 'backdrop-blur-xs bg-inverted/75'
          }
        }
      }
    }
  }
})
