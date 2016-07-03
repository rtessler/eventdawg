$(document).ready(function() {	

(function( $ ) {
    
    // private variables and methods

    var nodemap = {};
    var settings;    
    var self;
    var treeview = false; 
        
	function buildData(data) 
    {
        var root = [];

        // build hierarchical source.

        // parent nodes must occur before child nodes in data array
        // I do not change order of items
        // each item must have {id,text}
        // optional fields: pid, selected, image
        // you need pid if you want to build a tree

        var nextid = 1;
        
        for (var i = 0, len = data.length; i < len; i++) 
        {
            var item = data[i];
            var pid = item["pid"];
            var id = item["id"];
            var text = item['text'];

            // default values

            if (id === undefined)
            {
                id = nextid++;
                item["id"] = id;
            }                

            if (pid == undefined)
            {
                // no parent

                item["pid"] = 0;
                pid = 0;    
            }

            if (text == undefined)            
            {
                item['text'] = "";
            }            

            if (pid != 0) 
            {    
                treeview = true;        // its a treeview

                if  (nodemap[pid])
                {             
                    // parent exists
                    
                    if (!nodemap[pid].items) 
                        nodemap[pid].items = [];
                    
                    nodemap[pid].items[nodemap[pid].items.length] = item;
                    nodemap[id] = item;
                }
                else
                {
                    // parent does not exists
                    // error in data or node appears before its parent

                    error("teatree.buildData: parent node " + pid + " not found. Error in data or node appears before its parent");
                }

            }
            else 
            {
                // top level node
                // parent does not exist
                
                root.push( item );
                nodemap[id] = item;                                
            }
        }
        
        return root;
	}

	function buildHTML(parent, items) 
    {           
        // controls: [{type: 'checkbox', position: 'left'},
        //              {type: 'radio', position: 'left'},
        //              {type: 'text', position: 'left',
        //              {type: 'image', position: 'right'}];
        // default:
        //
        // controls: [{type: 'checkbox', position: 'left'}, {type: 'text', position: 'left'}

        $.each(items, function () 
        {               
            // create LI element and append it to the parent element.

            var li;
            
            var c = "class='node' ";

            var selected = (this.selected == true || this.selected == 1 || this.selected == "true" || this.selected == "1");
            
            if (selected)
                c = "class='node selected' ";                
            
            var str = "<a " + c + " nodeid='" + this.id + "' pid='" + this.pid + "'>";
            
            // the value is stored in a invisible checkbox control
            // the reason this is here is for form submission in case you want to submit all checked checkboxes
                     
            if (settings.form)
            {   
                var checked = (selected) ? "checked='checked'" : "";                                         
                str += " <input type='checkbox' style='display:none;' " + checked + " class='value' name='teatree-checkbox[]' value='" + this.id + "' />";                           
            }

            if (!settings.controls || settings.controls.length == 0)
                settings.controls = [{type: 'text'}];

            for (var i = 0; i < settings.controls.length; i++)
            {
                var c = settings.controls[i];               

                if (c.position == undefined)
                    pos = "left";
                else
                    pos = c.position;

                if (pos != "left" && pos != "right")
                    pos = "left";

                switch (c.type)
                {
                    case 'checkbox':

                        if (selected)
                            str += "<div class='checkbox " + pos + " check-image'></div>"; 
                        else
                            str += "<div class='checkbox " + pos + " uncheck-image'></div>";   
                        break;

                    case 'radio':

                        str += "<div class='radio " + pos + "'><div class='radio-inner'></div></div>"; 
                        break;

                    case 'image':

                        str += "<img class='image " + pos + "' src='" + settings.image_path + this.image + "' />";
                        break;

                    default:

                        str += "<div class='text " + pos + "'>" + this.text + "</div>";  
                        break;                       
                }
            }
      
            str += "<div style='clear:both;'></div></a>"; 
            
            if ( (this.items && this.items.length > 0) || (treeview && this.pid == 0) )
            {
                // has child items
                
                li = $("<li><a class='expand closed-image' id='expand" + this.id + "'></a>" + str + "</li>");
            }
            else
            {
                // leaf node

                if (this.pid == 0)
                    li = $("<li>" + str + "</li>");
                else
                    li = $("<li><div class='spacer'></div>" + str + "</li>");
            }

            li.appendTo(parent);
            // if there are sub items, call the buildHTML function.
            if (this.items && this.items.length > 0) {
                
                var ul = $("<ul class='teatree' style='display:none'></ul>");                           
                ul.appendTo(li);
                buildHTML(ul, this.items);
            }
        });
	}        

    function selectParent(id)
    {
        var node = nodemap[id];

        if (node)
        {
            var pid = node.pid;
            
            if (pid && pid != 0)
            {
                node = nodemap[pid];

                var p = self.find(" ul.teatree li a[nodeid='" + pid + "']");
                
                if (p)
                {
                    if (settings.form)
                    {
                        p.find(".value").attr('checked','checked');
                        p.find(".value").removeAttr('disabled');
                    }

                    p.find(".checkbox").removeClass("uncheck-image").removeClass("half-tick-image").addClass("check-image");
                    p.addClass("selected"); 

                    node.selected = 1;
                    selectParent(node.id);        // recursive
                }
            }
        }
        else
        {
            error("teatree.selectParent: node " + id + " not found");
        }            
    }    

    function selectNode(id)
    {
        var node = nodemap[id];

        if (node)
        {
            var e = self.find("ul.teatree li a.node[nodeid='" + id + "']");

            if (e)
            {
               

                if (settings.form)
                {
                    e.find(".value").attr('checked','checked');
                    e.find(".value").removeAttr('disabled');
                }
                       
                e.find(".checkbox").removeClass("half-tick-image").removeClass("uncheck-image").addClass("check-image");

                if (e.find(".radio").length > 0)
                {
                    var selected = getSelectedNodes();

                    self.find("ul.teatree li a.node.selected ").removeClass("selected");

                    for (var i = 0; i < selected.length; i++)
                    {
                        if (selected[i].id != id)                        
                            selected[i].selected = 0; 
                    }                    
                }

                node.selected = 1;  
                e.addClass("selected"); 
                
                // make sure the parent is selected
                
                if (settings.recursive)
                    selectParent(id);

                // select the children of this node

                if (settings.recursive)
                {
                    var arr = getChildNodes(id);

                    $.each(arr, function(index, n) {
                        selectNode(n.id);
                    });
                }              
            }
        }
        else
        {
            error("teatree.selectNode: node " + id + " not found");
        }
    }    

    function getChildNodes(id)
    {
        var n = nodemap[id];
        var arr = [];

        if (n)
        {
             $.each(nodemap, function(index, node) {
                if (node.pid == n.id)
                    arr.push(node);
             });
        }

        return arr;
    }

    function deselectNode(id) {

        var node = nodemap[id];

        if (node)
        {
            var e = self.find("ul.teatree li a.node[nodeid='" + id + "']");

            if (settings.form)
            {
                e.find(".value").removeAttr('checked');
                e.find(".value").attr('disabled', true);
            }

            node.selected = 0;

            e.find(".checkbox").removeClass("check-image").removeClass("half-tick-image").addClass("uncheck-image");

            e.removeClass("selected");

            // deselect children of this node

            if (settings.recursive) {

                var arr = getChildNodes(id);

                $.each(arr, function(index, n) {
                    deselectNode(n.id);
                });   

            }
         
            // not sure we actually want to deselect the parent

            //deselectParent(e);
        }
        else
        {
            error("teatree.deselectNode: node " + id + " not found");
        }
    }     

    function halfTickNode(id)
    {
        // e is a html link

        var node = nodemap[id];

        if (node)
        {
            var e = self.find("ul.teatree li a.node[nodeid='" + id + "']");

            deselectNode(id);

            node.selected = 2;

            e.find(".checkbox").removeClass("uncheck-image").removeClass("check-image").addClass("half-tick-image");    
        }
        else
        {
            error("teatree.halfTickNode: node " + id + " not found");
        }
    }    

    function deselectParent(e)
    {
        return;

        // doesnt work
        // if all sub items have been delected we should deselect the parent

        /*
        var sibling_no = 0;
        var siblings_not_selected = 0;

        $.each(nodemap, function(index, n) {

            if (n.pid == node.pid)
            {
                sibling_no++;

                if (n.selected == 0)
                    siblings_not_selected++;
            }
        }     
        */   

       var n = 0;

        $.each(e.parent().parent().find("li"), function() {

            if ($(this).find(".value").is(":checked"))
                n++;
        });        

        if (n == 0)
            deselectNode(e.parent().parent().find("a.node"));
    }

    function getSelectedNodes()
    {
        var nodes = [];

        $.each(nodemap, function(index, node) {

            if (node.selected == 1)
                nodes.push(node);
        });

        return nodes;
    }

    function error(msg)
    {
        if (window.console && window.console.log)               
            console.log(msg);
    }
	
    // public methods
        
    var methods = {
        init : function( options ) { 

            // events: select, expand, collapse, mouseover, mouseout
                        
            settings = $.extend( {
                data: null,  // mandatory
                animated: true,
                image_path: "images/", 
                form: false,
                controls: [{type: 'checkbox', position: 'left'}, {type: 'text', position: 'left'}],
                recursive: true
            }, options);
            
            var s = buildData(settings.data);		
            var ul = $("<ul class='teatree root'></ul>");		
            buildHTML(ul, s);
            ul.appendTo(this);   
            self = this;
            
            this.on( "click", "ul.teatree li:has(ul) > a.expand", function(e) {

                // expand/collapse	

                var nodeid = $(this).parent().find(".node").attr("nodeid");
                var node = nodemap[nodeid];

                if ($(this).parent().find("ul").is(":visible"))
                {       
                    // collapse

                    $(this).removeClass("open-image").addClass("closed-image");	
                    self.trigger("collapse", node); 		
                }
                else	
                {
                    // expand

                    $(this).removeClass("closed-image").addClass("open-image");
                    self.trigger("expand", node); 
                }

                if (settings.animated)
                    $(this).parent().find("ul").first().slideToggle(100);	
                else	
                    $(this).parent().find("ul").first().slideToggle(0);	         
            });

            this.on( "mouseover", "ul.teatree li a.node", function(e) {

                var nodeid = $(this).attr("nodeid");
                var node = nodemap[nodeid];

                self.trigger("mouseover", node);              
            });

            this.on( "mouseout", "ul.teatree li a.node", function(e) {

                var nodeid = $(this).attr("nodeid");
                var node = nodemap[nodeid];

                self.trigger("mouseout", node);                 
            });	        

            this.on( "click", "ul.teatree li a.node", function(e) {

                // node click

                var nodeid = $(this).attr("nodeid");
                var node = nodemap[nodeid];

                //var v = $(this).find(".value").val();   // the value of the node

                // note: selectNode and deselectNode are recursive
                // however the onclick only fires once
                // to find out whats been selected call getSelected

                if (node)
                {
                    if (node.selected == 1)
                    {
                        deselectNode(nodeid);
                        self.trigger("select", node);
                    }
                    else
                    {    
                        selectNode(nodeid);
                        self.trigger("select", node); 
                    }	
                }	
                else
                {
                    error("teatree node click: node not found");
                }
            });                
        },
        stopListening: function()
        {
            this.off();
        },
        select: function(id) {

            selectNode(id);            
        },
        deselect: function(id) {
 
            deselectNode(id);          
        },
        isSelected: function(id)
        {
            return nodemap[id].selected;        // returns 1 or 0
        },
        get: function(id)
        {
            return nodemap[id];
        },
        getParent: function(id)
        {
            var n = nodemap[id];

            if (n)
            {           
                if (!n.pid) 
                    return null;

                if (n.pid == 0)
                    return null;

                var n = nodemap[n.pid];

                if (n)
                    return n;
            }

            return null;
        },
        getChildren: function(id)
        {
            return getChildNodes(id);
        },
        getSiblings: function(id)
        {
            var n = nodemap[id];
            var nodes = [];

            if (n)
            {
                 $.each(nodemap, function(index, node) {
                    if (node.pid == n.pid)      // same parent
                        nodes.push(node);
                 });
            }

            return nodes;
        },
        getSelected: function()
        {
            return getSelectedNodes();
        },
        getAll: function()
        {
            var nodes = [];

            $.each(nodemap, function(index, node) {
                nodes.push(node);
            });

            return nodes;
        },
        selectAll: function()
        {
            // if recursive is true only need to select top level nodes 
            // and all child nodes will automatically be selected

            this.message("selectall");

            $.each(nodemap, function(index, node) {

                if (!settings.recursive || (settings.recursive && node.pid == 0)) {
                    selectNode(node.id);
                }
            });
        },
        deselectAll: function()
        {
            // if recursive is true only need to select top level nodes 
            // and all child nodes will automatically be deselected

            $.each(nodemap, function(index, node) {

                if (!settings.recursive || (settings.recursive && node.pid == 0)) {
                    deselectNode(node.id);
                }
            });
        },
        halfTickAll: function()
        {
            $.each(nodemap, function(index, node) {
                halfTickNode(node.id);
            });
        },
        halfTick: function(id)
        {
            halfTickNode(id);
        }     
      };
  
  
    $.fn.teatree =  function( method ) {

    // see: http://docs.jquery.com/Plugins/Authoring

      if ( methods[method] ) {
        return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof method === 'object' || ! method ) {
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.teatree' );
      }    

    };
 
 
})( jQuery );

});