<script lang="ts">
  import { FieldNumber } from '@txstate-mws/carbon-svelte'
  export let data: any
</script>

<FieldNumber path="gpa" labelText="GPA" helperText="You current GPA" allowDecimal step={0.1} />
