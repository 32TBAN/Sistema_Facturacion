<script>
export default {
    props:{
        total: Number
    },
    methods: {
        close(){
            this.$emit('close')
        },
        comprar(){
            this.$emit('comprar')
        },
    }
};
</script>
<template>
  <div class="pop-up">
    <div class="pop-up-inner">
        <div class="pop-up-close" @click="close()">
            &times;
        </div>
        <h1>Orden de venta</h1>
        <font-awesome-icon :icon="['fas', 'percent']" />
        <p class="m-4">Total: {{total.toFixed(2)}} </p>
        <button class="btn btn-danger m-4" @click="close()">Cancelar</button>
        <button class="btn btn-success m-4 " @click="comprar()">Finalizar</button>
    </div>
  </div>
</template>

<style lang="scss">
 .pop-up{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    padding: 32px 16px 120px;
    height: 100vh;
    widows: 100%;
    background-color: #52a07ed5;
    display: grid;
    place-items: center;

    &-close{
        position: absolute;
        height: 52px;
        widows: 52px;
        display: flex;
        justify-content: center;
        align-content: center;
        top: 0;
        right: 0;
        font-size: 3rem;
        color: #d6d6d6;
        cursor: pointer;
    }

    &-inner{
        background-color: #fff;
        color: #000;
        position: relative;
        widows: 60%;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 5px 5px #000; 
        transition: all 250ms ease-in-out;   
    }
 }

 .fade-enter, .fade-leave-to{
    opacity: 0;
    .pop-up-inner{
        opacity: 0;
        transform: translateY(-32px);
    }
 }
.fade-enter-active, .fade-leave-active{
    transition: all 250ms ease-in-out;
}

.fade-leave-active {
    transition-delay: 250ms;
}
</style>
