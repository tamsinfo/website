<script lang="ts">
  import { reveal } from "../lib/motion/reveal";

  let {
    columns,
    rows,
    caption,
  }: { columns: string[]; rows: { label: string; cells: string[] }[]; caption?: string } = $props();
</script>

<div class="scroller" use:reveal>
  <table style:--cols={columns.length}>
    {#if caption}<caption class="visually-hidden">{caption}</caption>{/if}
    <thead>
      <tr>
        <td></td>
        {#each columns as c (c)}<th scope="col">{c}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as r (r.label)}
        <tr>
          <th scope="row">{r.label}</th>
          {#each r.cells as cell, i (i)}<td>{cell}</td>{/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .scroller {
    overflow-x: auto;
    margin-inline: calc(var(--gutter) * -1);
    padding-inline: var(--gutter);
  }
  table {
    width: 100%;
    min-width: 640px;
    border-collapse: collapse;
    table-layout: fixed;
  }
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding: 18px 20px 20px 0;
    border-top: 1px solid var(--rule);
  }
  thead th {
    font-family: var(--font-display);
    font-stretch: 110%;
    font-weight: 640;
    font-size: var(--fs-h4);
    line-height: 1.2;
    border-top: 2px solid var(--blue);
    padding-top: 16px;
  }
  thead td {
    border-top: 0;
  }
  tbody th {
    width: 22%;
    font-weight: 600;
    color: var(--ink);
  }
  td {
    color: var(--ink-2);
  }
  tbody tr:last-child th,
  tbody tr:last-child td {
    border-bottom: 1px solid var(--rule);
  }
</style>
