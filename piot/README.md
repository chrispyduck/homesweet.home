# piot: Pi-of-Things

The beginnings of a simple REST service that can run on Raspberry Pi devices throughout my home, which will be controlled by a central 
service such as (OpenHAB)[https://github.com/openhab/openhab].

## Concepts
A *Thing* is an abstract concept that, at present, represents a GPIO pin with a binary on/off value.

## High-Level Goals
* Authentication
* Configurable Behaviors, such as to say that a switch should turn itself off after being on for 5 minutes
* Support for I2C Things, such as temperature sensors 