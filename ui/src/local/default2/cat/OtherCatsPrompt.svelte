<script lang="ts">
  import { FieldRadio } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldRadio path="hasOtherCats" boolean labelText="Do you have other cats?" items={[{ label: "Yes", value: true }, { label: "No", value: false }]} />
