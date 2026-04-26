<script lang="ts">
  import YesNoFollowUp from "../_templates/YesNoFollowUp.svelte"
  export let data: any
</script>

<YesNoFollowUp {data} path="haveCatTower" legend="Do you have a cat tower in your house?" followUp={{ path: "willPurchaseCatTower", label: "I agree to purchase a cat tower upon adoption.", showWhen: "no" }} />
