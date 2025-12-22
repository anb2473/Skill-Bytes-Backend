# Docker Swarm Deployment Guide

This document provides instructions for deploying this application on a Linux server cluster using Docker Swarm. This guide is intended for production deployment only. Please refer to [COMPOSE.md](./COMPOSE.md) for development deployment information.

## Prerequisites

The following prerequisites must be satisfied before proceeding with the deployment:

**NOTE:** While this guide is designed for Linux-based systems, a similar process may be applied to clusters consisting of non-Linux computers. However, Linux is recommended for simplified setup and configuration.

1. One Linux computer must be designated as the cluster's manager node
2. At least one additional Linux computer must be available to serve as a worker node
3. All devices must be connected to the same private network
4. This repository must be cloned onto the manager node

## Setup Guide

### 1. Initialize Swarm

On the manager node, execute the following command to retrieve the private IP address:
```bash
hostname -i
```
This command will output the private IP address of the manager node. Using that IP address, initialize Docker Swarm as follows:
```bash
docker swarm init --advertise-addr <PRIVATE_IP>
```
This command will output a join token. Retain this token for use in the subsequent step.

### 2. Join Worker Nodes

On each worker node, execute the following command using the private IP address and token obtained from the previous step:
```bash
docker swarm join --token <TOKEN> <PRIVATE_IP>:2377
```
To verify that all nodes have successfully joined the swarm, navigate to the manager node and execute:
```bash
docker node ls
```
All worker nodes should be listed in the output.

### 3. Create the Registry

Docker Swarm does not build images directly; therefore, a registry is required to manage image deployments. Execute the following command on the manager node to create a local registry service:
```bash
docker service create \
  --name registry \
  --publish 5000:5000 \
  registry:2
```

### 4. Build the Dockerfile

Navigate to the [server](../server) directory. Once in the appropriate directory, build the Dockerfile and push the resulting image to the registry using the following commands (ensure the correct private IP address is inserted):
```bash
docker build -t <PRIVATE_IP>:5000/skillbytes-server:1 .
docker push <PRIVATE_IP>:5000/skillbytes-server:1
```

### 5. Deploy Project

To deploy the project to the swarm cluster, execute the following command:
```bash
docker stack deploy -c docker-swarm.yaml skillbytes
```

## Deploying Changes

### If Changes Affect the docker-swarm.yaml Configuration

Execute the following command to redeploy the stack:
```bash
docker stack deploy -c docker-swarm.yaml skillbytes
```

### If Changes Affect the Codebase

Execute the following commands to build a new image version, push it to the registry, and redeploy the stack (ensure the version number is updated in both the commands and the docker-swarm.yaml file):
```bash
docker build -t <PRIVATE_IP>:5000/skillbytes-server:2 .
docker push <PRIVATE_IP>:5000/skillbytes-server:2
docker stack deploy -c docker-swarm.yaml skillbytes
```
