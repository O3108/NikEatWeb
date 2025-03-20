import React from 'react';
import {neon} from "@neondatabase/serverless";

const Neon = () => {
  async function create(formData: FormData) {
    'use server';
    // Connect to the Neon database
    const sql = neon(`${process.env.DATABASE_URL}`);
    const comment = formData.get('comment');
    // Insert the comment from the form into the Postgres database
    await sql('INSERT INTO products (name, value) VALUES ($1, $2)', ['test', 1]);
  }


  return (
    <form action={create}>
      <input type="text" placeholder="write a comment" name="comment"/>
      <button type="submit">Submit</button>
    </form>
  );
};

export default Neon;
