<script lang="ts">
    export let structure: Table;
    export let table: string;
</script>

<div class="table_container">
   <table class="table">
       <thead>
           <tr>
               <th scope="col">Name</th>
               <th scope="col">DataType</th>
               <th scope="col">Key</th>
               <th scope="col">Nullable</th>
               <th scope="col">Default</th>
               <th scope="col">Extra</th>
           </tr>
       </thead>
       <tbody>
           {#each structure.cols as field}
               <tr>
                   <td>{field.Field}</td>
                   <td>{field.Type}</td>
                   <td>{field.Key}</td>
                   <td>{field.Null}</td>
                   <td>{field.Default}</td>
                   <td>{field.Extra}</td>
                   <td>
                        <form method="POST" action="?/delete">
                            <input type="hidden" value={field.Field} name="col" />
                            <input type="hidden" value={table} name="table" />
                            <input type="hidden" value={structure.db} name="db" />
                            <button class="btn btn-danger">Delete field</button>
                        </form>
                   </td>
               </tr>
           {/each} 
       </tbody>
   </table>
</div>

<style>
   .table_container {
       padding-left: 20em;
       margin-top: 4em;
   }
</style>
