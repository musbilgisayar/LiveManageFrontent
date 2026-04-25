"use client";

import React from "react";
import { MapContainer as RLMapContainer, TileLayer as RLTileLayer, Marker as RLMarker } from "react-leaflet";
import type { MapContainerProps, TileLayerProps, MarkerProps } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// 🔹 Marker ikonları için path düzeltme
L.Icon.Default.mergeOptions({
  iconUrl,
  shadowUrl,
});

export const SafeMapContainer = ({
  children,
  center,
  zoom = 6,
}: {
  children: React.ReactNode;
  center: [number, number];
  zoom?: number;
}) => {
  const props: MapContainerProps = {
    center,
    zoom,
    style: { height: "100%", width: "100%" },
  } as MapContainerProps;

  return <RLMapContainer {...props}>{children}</RLMapContainer>;
};

export const SafeTileLayer = () => {
  const props: TileLayerProps = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  } as TileLayerProps;

  return <RLTileLayer {...props} />;
};

export const SafeMarker = ({ position }: { position: [number, number] }) => {
  const props: MarkerProps = {
    position,
  } as MarkerProps;

  return <RLMarker {...props} />;
};
