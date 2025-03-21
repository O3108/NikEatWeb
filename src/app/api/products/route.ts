import {NextResponse} from "next/server";
import {neon} from "@neondatabase/serverless";
import {Product} from "@/src/app/Providers/StoreProvider";

type SERVER_PRODUCTS = Record<"id" | 'name' | "value", number | string>[]

export const GET = async () => {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response: SERVER_PRODUCTS = await sql('SELECT * FROM products ORDER BY name ASC')

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({error: error.message});

  }
}

export const PUT = async (req: Request) => {
  const product: Omit<Product, 'id'> = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql('INSERT INTO products (name, value) VALUES ($1, $2)', [product.name, product.value])

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}

export const PATCH = async (req: Request) => {
  const products: Product[] = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    for (const product of products) {
      await sql(`UPDATE products
                 SET name  = '${product.name}',
                     value = ${product.value}
                 WHERE ID = ${product.id}`)
    }

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}

export const DELETE = async (req: Request) => {
  const product: Product = await req.json()

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    await sql(`DELETE
               FROM products
               WHERE ID = ${product.id}`)

    return NextResponse.json({status: 200});
  } catch (error: any) {
    return NextResponse.json({error: error.message});
  }
}
