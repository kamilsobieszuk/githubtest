G.EditorLvlMgr = function (game) {};

G.EditorLvlMgr.prototype = { 

    init: function() {


    },

    preload: function() {

 
    },

    create: function () {

        s = game.state.getCurrentState();

        this.selected = [];

        this.mainLine = new G.EditorLine(G.json.levels);

       // this.itemSelector = new G.BoardItemSelector();

        game.time.events.add(10,function(){
            game.scale.setGameSize(2200,1000)});
    },

    update: function() {

        
   
    },

    selectItems: function(rect) {

        this.selected.forEach(function(item) {item.deselect()});
        this.selected = [];

        this.lineGroup.forEach(function(item) {

            var itemRect = item.getBounds();

            if (rect.intersects(itemRect)) {
                this.selected.push(item);
                item.select();
            }

        },this);

    },

    render: function () {
       
       game.debug.text(game.time.desiredFps,10,50);
    }
};
