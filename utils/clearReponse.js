export const clearResponseString = (text) => {
  return text
    .replace(/```json/g, "")
    .replace(/```js/g, "")
    .replace(/```ts/g, "")
    .replace(/```py/g, "")
    .replace(/```sh/g, "")
    .replace(/```html/g, "")
    .replace(/```css/g, "")
    .replace(/```bash/g, "")
    .replace(/```text/g, "")
    .replace(/```diff/g, "")
    .replace(/```/g, "")
    .replace(/\n/g, "")
    .replace(/```[a-z]*\n?/g, "") // remove code block markers
    .replace(/\\/g, "\\\\") // escape backslashes
    .replace(/"/g, '\\"') // escape double quotes
    .replace(/\r?\n/g, "\\n");
};
