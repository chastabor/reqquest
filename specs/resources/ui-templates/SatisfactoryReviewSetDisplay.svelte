<!--
  SatisfactoryReviewSetDisplay — read-only counterpart to
  SatisfactoryReviewSet. Renders "<label> is (un)satisfactory." for each
  item whose path has been answered.
-->
<script lang="ts">
  export let data: Record<string, any> = {}
  export let items: { path: string, label: string }[] = []
</script>

{#each items as item (item.path)}
  {#if data?.[item.path]?.satisfactory != null}
    <div>{item.label} is {data[item.path].satisfactory ? '' : 'un'}satisfactory.</div>
  {/if}
{/each}
