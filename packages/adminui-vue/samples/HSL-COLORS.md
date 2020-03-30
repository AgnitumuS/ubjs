Colors are based on the hsl format (hue, saturation, lightness) <br>
All variables consist of hs + l combinations.<br>
hs - the basis of color <br>
l - indicates how much color will be closer to black or white <br>
Each color has its own modifiers. <br>
For example, to get the "success-hover" combination, you need to use them like this: <br>
`hsl(var(--hs-success), var(--l-state-default))`

Colors can combined just inside own block. <br>
For example text **HS** can combined just with text **L**

>`hsl(var(--hs-text), var(--l-text-description))`

or border can combine only with border lightness modifiers

>`hsl(var(--hs-border), var(--l-layout-border-default))` <br>
>`hsl(var(--hs-border), var(--l-input-border-disabled))` <br>
>`hsl(var(--hs-border), var(--l-input-border-hover))` <br>

But each section **HS** can replaced by state colors
for example if need primary border
> `hsl(var(--hs-primary), var(--l-input-border-default))`

or danger button
> `hsl(var(--hs-danger), var(--l-state-default))` <br>
> `hsl(var(--hs-danger), var(--l-state-hover))`

```css
:root {
 /* state colors */
  --hs-primary: 220, 80%;
  --hs-success: 120, 30%;
  --hs-warning: 20, 65%;
  --hs-danger: 360, 60%;

  /* Controls - buttons, icons etc. */
  --hs-control: 220, 15%;
  --l-state-default: 45%;
  --l-state-hover: 60%;
  --l-state-active: 35%;
  --l-state-disabled: 85%;

  /* text */
  --hs-text: 240, 5%;
  --l-text-default: 20%;
  --l-text-label: 45%;
  --l-text-description: 60%;
  --l-text-disabled: 80%;
  --l-text-inverse: 100%;

  /* border */
  --hs-border: 220, 20%;
  --l-input-border-default: 60%;
  --l-input-border-hover: 40%;
  --l-input-border-disabled: 75%;
  --l-layout-border-default: 80%;
  --l-layout-border-light: 90%;

  /* background */
  --hs-background: 220, 20%;
  --l-background-default: 95%;
  --l-background-active: 90%;
  --l-background-inverse: 100%;
}
```
