
# Ray-Triangle Intersection in 3D

## Description
This project demonstrates how to determine whether a ray intersects a triangle in 3D space using the Möller–Trumbore algorithm.

## Algorithm Overview
Given triangle vertices `v0`, `v1`, `v2` and ray with origin `o` and direction `d`, the algorithm checks:
- If the ray is parallel to the triangle.
- If the intersection lies within the triangle bounds.
- The distance `t` along the ray where the intersection occurs.

## JavaScript Implementation
Includes a `Vector3D` class with basic vector operations and a `rayIntersectsTriangle` function that returns either the intersection distance or `null`.

## Files
- `ray_triangle_intersection.js` — JavaScript code including `Vector3D` class and intersection test.
