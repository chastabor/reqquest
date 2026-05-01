<script lang="ts">
  import SelectValueLabel from "../_templates/SelectValueLabel.svelte"
  export let data: any
  export let fetched: any
</script>

<SelectValueLabel {data} {fetched} path="rating" labelPath="ratingName" labelText="Rating" required listKey="ratingLevels5" />
