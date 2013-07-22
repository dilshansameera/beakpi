/*  This file is part of BeakPi.

    BeakPi is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    BeakPi is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with BeakPi.  If not, see <http://www.gnu.org/licenses/>. */


define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/when",
  "dojo/aspect",
  "dojo/on",
  "dojo/touch",
  "dojo/dom-construct",
  "dojo/dom-attr",
  "dojo/dom-geometry",
  "dojo/dom-style",
  "dijit/_WidgetBase",
  "dijit/form/Button",
  "bpi/music/track",
  "bpi/utils/util"
],

function (declare, lang, when, aspect, on, touch, domConst, domAttr, domGeom, domStyle, _WidgetBase, Button, track, util){
  return declare([_WidgetBase], {

    _resultsInfo: null,

    listStored: function(domHolder, buttonSplit, domToPlaceInto) {
      var storedPlaylists = [], _self = this, btnPlaylistTitle;
      when(util.command("mpc lsplaylists")).then(lang.hitch(this, function(storedPlaylists){
        console.log(storedPlaylists);
        domConst.empty(domHolder);
        btnPlaylistTitle= new Button({
          label: "Current Playlist",
          onClick: function(){
            _self.listCurrent(domToPlaceInto);
          }
        });
        btnPlaylistTitle.placeAt(domHolder);
        domStyle.set(btnPlaylistTitle.domNode,"width","80%");
        domStyle.set(btnPlaylistTitle.domNode.firstChild, "display", "block");

        domConst.place("<br /><span>_______</span><br /><br />", domHolder);

        for (i = 0; i <= storedPlaylists.length; i++) {
          if (storedPlaylists[i] !== "" && storedPlaylists[i] !== undefined && storedPlaylists[i] !== "Starred") {
            btnPlaylistTitle = new Button({
              label: storedPlaylists[i],
              onClick: function(){
                when(util.commandTracklist("clear"), lang.hitch(this, function(){
                  _self.playlistLoading();
                  util.command(("mpc load '" + this.label +"'")).then(lang.hitch(this, function(res) {
                    _self.listCurrent(domToPlaceInto);
                  }));
                }));
              }
            });
            btnPlaylistTitle.placeAt(domHolder);
            domStyle.set(btnPlaylistTitle.domNode,"width","80%");
            domStyle.set(btnPlaylistTitle.domNode.firstChild, "display", "block");
            if (buttonSplit) {
              domConst.place(buttonSplit, domHolder);
            }
          }
        }
      }));
    },

    listCurrent: function(domToPlaceInto) {
      var tracklist = [], i, individualTrack = [];
      domConst.empty(domToPlaceInto);
      when(util.command("mpc playlist")).then(lang.hitch(this, function(tracklist){
        this._summary("Current Playlist");
        if(tracklist) {
          for(i = 0; i <= tracklist.length; i++ ){
            if(tracklist[i] !== "" && tracklist[i] !== undefined) {
              var trackResult = new track();
              individualTrack = tracklist[i].split(" - ");
              when(trackResult.displayTrack({name: individualTrack[0], href: (i + 1), artist: individualTrack[1]}, domToPlaceInto, false)).then(lang.hitch(this, function(){
                aspect.after(trackResult, "onPlaylistRemove", lang.hitch(this, function(){ this.listCurrent() }));
              }));
            }
          }
        }
        else{
          domAttr.set(domToPlaceInto, "innerHTML", "<span class='noSongs'>No songs Queued</span>");
        }
      }));
    },

    _summary: function(result) {
      domAttr.set(this._resultsInfo, "innerHTML", "Playlist: " + result);
    },

    _setResultsInfoAttr: function (val){
      this._resultsInfo = val;
    },

    playlistLoading: function() {
      // Synthetic Event
    }

  });
});