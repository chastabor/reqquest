<script lang="ts">
  import RateReviewSet from "../_templates/RateReviewSet.svelte"
  export let data: any
  export let fetched: any
</script>

<RateReviewSet {data} {fetched} listKey="ratingLevels5" required items={[{ path: "letter", label: "Faculty recommendation letter rating" }]} />
