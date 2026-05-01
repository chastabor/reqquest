<script lang="ts">
  import RateReviewSetDisplay from "../_templates/RateReviewSetDisplay.svelte"
  export let data: any
  export let fetched: any
</script>

<RateReviewSetDisplay {data} {fetched} items={[{ path: "letter", label: "Faculty recommendation letter rating" }]} />
