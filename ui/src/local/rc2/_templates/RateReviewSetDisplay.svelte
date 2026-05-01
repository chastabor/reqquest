<!--
  RateReviewSetDisplay — read-only counterpart to RateReviewSet. Renders
  "<label>: <ratingName ?? rating>" for each item whose rating has been
  set.
-->
<script lang="ts">
  export let data: Record<string, any> = {}
  export let items: { path: string, label: string }[] = []
</script>

{#each items as item (item.path)}
  {#if data?.[item.path]?.rating != null}
    <div>{item.label}: {data[item.path].ratingName ?? data[item.path].rating}</div>
  {/if}
{/each}
