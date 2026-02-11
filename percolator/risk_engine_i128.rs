// Minimal stub for i128/U128 types so risk_engine.rs compiles standalone
// In your real project, replace this with your full BPF-safe 128-bit implementation.

#![no_std]

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct U128(u128);

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct I128(i128);

impl U128 {
    pub const ZERO: Self = Self(0);
    pub fn new(v: u128) -> Self { Self(v) }
    pub fn get(&self) -> u128 { self.0 }
    pub fn is_zero(&self) -> bool { self.0 == 0 }
    pub fn saturating_add(self, other: Self) -> Self { Self(self.0.saturating_add(other.0)) }
    pub fn saturating_add_u128(self, other: Self) -> Self { Self(self.0.saturating_add(other.0)) }
    pub fn saturating_sub(self, other: Self) -> Self { Self(self.0.saturating_sub(other.0)) }
}

impl I128 {
    pub const ZERO: Self = Self(0);
    pub fn new(v: i128) -> Self { Self(v) }
    pub fn get(&self) -> i128 { self.0 }
    pub fn is_negative(&self) -> bool { self.0 < 0 }
    pub fn is_positive(&self) -> bool { self.0 > 0 }
    pub fn is_zero(&self) -> bool { self.0 == 0 }
    pub fn saturating_add(self, v: i128) -> Self { Self(self.0.saturating_add(v)) }
    pub fn saturating_sub(self, v: i128) -> Self { Self(self.0.saturating_sub(v)) }
}

pub mod i128 {
    pub use super::{I128, U128};
}
