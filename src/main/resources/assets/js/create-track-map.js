L.CRS.Minecraft = L.Util.extend(L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
})

L.CoordsControl = L.Control.extend({
  options: {
    position: "bottomright",
  },

  initialize(opts) {
    L.Util.setOptions(this, opts)
  },

  _createElement() {
    let el = document.createElement("div")
    el.classList.add("coords-control")

    let curEl = document.createElement("div")
    curEl.classList.add("cursor-coords")
    let curIcon = document.createElement("object")
    curIcon.classList.add("icon")
    curIcon.data = "assets/icons/cursor.svg"
    let curX = document.createElement("span")
    let curZ = document.createElement("span")
    curX.classList.add("cursor-x")
    curZ.classList.add("cursor-z")
    curEl.appendChild(curIcon)
    curEl.appendChild(curX)
    curEl.appendChild(curZ)
    el.appendChild(curEl)

    let ctrEl = document.createElement("div")
    let ctrIcon = document.createElement("object")
    ctrIcon.classList.add("icon")
    ctrIcon.data = "assets/icons/center.svg"
    let ctrX = document.createElement("span")
    let ctrZ = document.createElement("span")
    ctrX.classList.add("center-x")
    ctrZ.classList.add("center-z")
    ctrEl.appendChild(ctrIcon)
    ctrEl.appendChild(ctrX)
    ctrEl.appendChild(ctrZ)
    el.appendChild(ctrEl)

    return el
  },

  onAdd(map) {
    let el = this._createElement()

    this.centerX = el.getElementsByClassName("center-x")[0]
    this.centerZ = el.getElementsByClassName("center-z")[0]
    this.cursorX = el.getElementsByClassName("cursor-x")[0]
    this.cursorZ = el.getElementsByClassName("cursor-z")[0]

    this.cursor = el.getElementsByClassName("cursor-coords")[0]

    map.on("zoom", this._updateCenterCoords, this)
    map.on("move", this._updateCenterCoords, this)
    map.on("mouseover", this._showCursorCoords, this)
    map.on("mousemove", this._updateCursorCoords, this)
    map.on("mouseout", this._clearCursorCoords, this)

    this._updateCenterCoords()
    this._clearCursorCoords()

    return el
  },

  onRemove(map) {
    document.getElementById("ctm-coords-control").remove()

    map.off("zoom", this._updateCenterCoords, this)
    map.off("move", this._updateCenterCoords, this)
    map.off("mouseover", this._showCursorCoords, this)
    map.off("mousemove", this._updateCursorCoords, this)
    map.off("mouseout", this._clearCursorCoords, this)
  },

  _updateCenterCoords() {
    const coords = map.getCenter()
    const x = Math.round(coords.lng)
    const z = Math.round(coords.lat)

    this.centerX.textContent = x.toString()
    this.centerZ.textContent = z.toString()
  },

  _updateCursorCoords(event) {
    const coords = event.latlng
    const x = Math.round(coords.lng)
    const z = Math.round(coords.lat)

    this.cursor.style.display = "block"
    this.cursorX.textContent = x.toString()
    this.cursorZ.textContent = z.toString()
  },

  _showCursorCoords() {
    this.cursor.style.display = "block"
  },

  _clearCursorCoords() {
    this.cursor.style.display = "none"
    this.cursorX.textContent = "--"
    this.cursorZ.textContent = "--"
  },
})

L.coordsControl = (opts) => new L.CoordsControl(opts)

let xz = (x, z) => {
  if (typeof x === "number") {
    return [z, x]
  } else {
    return [x.z, x.x]
  }
}

let map = L.map("map", {
  crs: L.CRS.Minecraft,
  zoomControl: true,
  attributionControl: false,
})

fetch("api/config.json")
  .then((resp) => resp.json())
  .then((cfg) => {
    const { view } = cfg
    const {
      initial_position,
      initial_zoom,
      max_zoom,
      min_zoom,
      zoom_controls,
    } = view

    map.setMinZoom(min_zoom)
    map.setMaxZoom(max_zoom)

    const { x: initialX, z: initialZ } = initial_position
    map.setView([initialZ, initialX], initial_zoom)

    if (!zoom_controls) {
      map.zoomControl.remove()
    }

    L.coordsControl().addTo(map)
  })

const signalIcon = (color) =>
  L.divIcon({
    html: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 64 64"
    >
      <path class="frame" d="M44 0c11.046 0 20 8.954 20 20 0 10.37-7.893 18.897-17.999 19.901L46 60h18v4H24v-4h18V39.901C31.893 38.898 24 30.371 24 20 24 8.954 32.954 0 44 0Zm0 4c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16S52.837 4 44 4Z"/>
      <path class="light" d="M44 4c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16S52.837 4 44 4Z"/>
    </svg>`,
    className: `signal-icon ${color}`,
    iconSize: [16, 16],
    iconAnchor: [2, 16],
  })

const stationIcon = L.divIcon({
  html: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 64 64"
    >
      <path class="outline" d="M56 0a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h48Z"/>
      <path class="fill" d="M56 4H8a4 4 0 0 0-3.995 3.8L4 8v48a4 4 0 0 0 3.8 3.995L8 60h48a4 4 0 0 0 3.995-3.8L60 56V8a4 4 0 0 0-3.8-3.995L56 4Z"/>
      <path class="outline" d="m33.287 16.466.127.116 14 14 .117.128a2 2 0 0 1 0 2.574l-.117.127-.127.117a2 2 0 0 1-2.574 0l-.127-.117-10.587-10.586L34 49.997l-.005.149a2 2 0 0 1-3.99 0l-.005-.15V22.826L19.413 33.411l-.127.117a2 2 0 0 1-2.818-2.818l.117-.128 14-14 .127-.116a2 2 0 0 1 2.574 0ZM50.36 10l.149.005a2 2 0 0 1 .003 3.99l-.149.005-36 .033-.15-.005a2 2 0 0 1-.003-3.99l.15-.005 36-.033Z"/>
    </svg>`,
  className: "station-icon",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const portalIcon = L.divIcon({
  html: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 64 64"
    >
      <path class="outline" d="M56 0a8 8 0 0 1 8 8v48a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8h48Z"/>
      <path class="fill" d="M56 4H8a4 4 0 0 0-3.995 3.8L4 8v48a4 4 0 0 0 3.8 3.995L8 60h48a4 4 0 0 0 3.995-3.8L60 56V8a4 4 0 0 0-3.8-3.995L56 4Z"/>
      <path class="outline" d="m29.287 18.469.127.117 12 12a2 2 0 0 1 .17 2.635l-.114.136-12 13a2 2 0 0 1-3.051-2.582l.111-.132L35.431 34H10a2 2 0 0 1-.15-3.995L10 30h25.171l-8.585-8.586a2 2 0 0 1-.117-2.701l.117-.127a2 2 0 0 1 2.701-.117Z"/>
      <path class="outline" d="M49 9a6 6 0 0 1 5.996 5.775L55 15v34a6 6 0 0 1-5.775 5.996L49 55h-8a6 6 0 0 1-5.996-5.775L35 49v-3a2 2 0 0 1 3.995-.15L39 46v3a2 2 0 0 0 1.85 1.995L41 51h8a2 2 0 0 0 1.995-1.85L51 49V15a2 2 0 0 0-1.85-1.995L49 13h-8a2 2 0 0 0-1.995 1.85L39 15v4a2 2 0 0 1-3.995.15L35 19v-4a6 6 0 0 1 5.775-5.996L41 9h8Z"/>
    </svg>`,
  className: "portal-icon",
  iconSize: [24, 24],
})

map.createPane("tracks")
map.createPane("signal-blocks")
map.createPane("trains")
map.createPane("signals")
map.createPane("stations")
map.getPane("tracks").style.zIndex = 300
map.getPane("signal-blocks").style.zIndex = 500
map.getPane("trains").style.zIndex = 700
map.getPane("signals").style.zIndex = 800
map.getPane("stations").style.zIndex = 800

map.getPane("tooltipPane").style.zIndex = 1000

let edgeLayer = L.layerGroup([], { pane: "tracks" }).addTo(map)
let stationLayer = L.layerGroup([], { pane: "stations" }).addTo(map)
let portalLayer = L.layerGroup([], { pane: "stations" }).addTo(map)
let signalLayer = L.layerGroup([], { pane: "signals" }).addTo(map)
let blockLayer = L.layerGroup([], { pane: "signal-blocks" }).addTo(map)
let trainLayer = L.layerGroup([], { pane: "trains" }).addTo(map)

const networkStream = new EventSource("api/network.rt")
const blockStatusStream = new EventSource("api/blocks.rt")
const signalStatusStream = new EventSource("api/signals.rt")
const trainStatusStream = new EventSource("api/trains.rt")

networkStream.onmessage = (e) => {
  let { edges, portals, stations } = JSON.parse(e.data)

  edgeLayer.clearLayers()
  edges.forEach((edge) => {
    const path = edge.path
    if (path.length === 4) {
      L.curve(["M", xz(path[0]), "C", xz(path[1]), xz(path[2]), xz(path[3])], {
        className: "track",
        interactive: false,
        pane: "tracks",
      }).addTo(edgeLayer)
    } else if (path.length === 2) {
      L.polyline([xz(path[0]), xz(path[1])], {
        className: "track",
        interactive: false,
        pane: "tracks",
      }).addTo(edgeLayer)
    }
  })

  stationLayer.clearLayers()
  stations.forEach((stn) => {
    L.marker(xz(stn.location), {
      icon: stationIcon,
      rotationAngle: stn.angle,
      pane: "stations",
    })
      .bindTooltip(stn.name, {
        className: "station-name",
        direction: "top",
        offset: L.point(0, -12),
        opacity: 0.7,
      })
      .addTo(stationLayer)
  })

  portals.forEach((portal) => {
    L.marker(xz(portal.from.location), {
      icon: portalIcon,
      pane: "stations",
    })
      .on("click", (e) => map.panTo(xz(portal.to.location)))
      .addTo(portalLayer)
    L.marker(xz(portal.to.location), {
      icon: portalIcon,
      pane: "stations",
    })
      .on("click", (e) => map.panTo(xz(portal.from.location)))
      .addTo(portalLayer)
  })
}

blockStatusStream.onmessage = (e) => {
  let { blocks } = JSON.parse(e.data)

  blockLayer.clearLayers()
  blocks.forEach((block) => {
    if (!block.reserved && !block.occupied) {
      return
    }
    block.segments.forEach((path) => {
      if (path.length === 4) {
        L.curve(
          ["M", xz(path[0]), "C", xz(path[1]), xz(path[2]), xz(path[3])],
          {
            className:
              "track " +
              (block.reserved ? "reserved" : block.occupied ? "occupied" : ""),
            interactive: false,
            pane: "signal-blocks",
          }
        ).addTo(blockLayer)
      } else if (path.length === 2) {
        L.polyline([xz(path[0]), xz(path[1])], {
          className:
            "track " +
            (block.reserved ? "reserved" : block.occupied ? "occupied" : ""),
          interactive: false,
          pane: "signal-blocks",
        }).addTo(blockLayer)
      }
    })
  })
}

signalStatusStream.onmessage = (e) => {
  let { signals } = JSON.parse(e.data)

  signalLayer.clearLayers()
  signals.forEach((sig) => {
    if (!!sig.forward) {
      let marker = L.marker(xz(sig.location), {
        icon: signalIcon(sig.forward.state.toLowerCase()),
        rotationAngle: sig.forward.angle,
        interactive: false,
        pane: "signals",
      }).addTo(signalLayer)
    }
    if (!!sig.reverse) {
      let marker = L.marker(xz(sig.location), {
        icon: signalIcon(sig.reverse.state.toLowerCase()),
        rotationAngle: sig.reverse.angle,
        interactive: false,
        pane: "signals",
      }).addTo(signalLayer)
    }
  })
}

trainStatusStream.onmessage = (e) => {
  let { trains } = JSON.parse(e.data)

  trainLayer.clearLayers()
  trains.forEach((train) => {
    train.cars.forEach((car, i) => {
      let parts = car.portal
        ? [
            [xz(car.leading.location), xz(car.portal.from.location)],
            [xz(car.portal.to.location), xz(car.trailing.location)],
          ]
        : [[xz(car.leading.location), xz(car.trailing.location)]]

      parts.map((part) =>
        L.polyline(part, {
          weight: 12,
          lineCap: "square",
          className: "train",
          pane: "trains",
        })
          .bindTooltip(
            train.cars.length === 1
              ? train.name
              : `${train.name} <span class="car-number">${i + 1}</span>`,
            {
              className: "train-name",
              direction: "right",
              offset: L.point(12, 0),
              opacity: 0.7,
            }
          )
          .addTo(trainLayer)
      )
    })
  })
}
