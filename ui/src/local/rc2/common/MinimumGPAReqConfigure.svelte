<script lang="ts">
  import { FieldNumber } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldNumber path="minGPA" labelText="Minimum GPA" helperText="What is the minimum GPA to qualify for some programs?" allowDecimal step={0.1} />
