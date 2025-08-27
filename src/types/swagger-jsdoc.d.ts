declare module 'swagger-jsdoc' {
  export interface Options {
    definition: any;
    apis?: string[]; // ми генеруємо зі змінної, тому масив можна не вказувати
  }

  // повертає готовий OpenAPI-об’єкт
  export default function swaggerJSDoc(options: Options): any;
}
