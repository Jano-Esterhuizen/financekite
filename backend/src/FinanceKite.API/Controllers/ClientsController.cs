using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.Application.Features.Clients;
using Microsoft.AspNetCore.Mvc;

[Route("api/businesses/{businessId:guid}/clients")]
public class ClientsController(ClientService clientService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid businessId, CancellationToken cancellationToken)
    {
        var result = await clientService.GetAllAsync(businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        var result = await clientService.GetByIdAsync(id, businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}/health")]
    public async Task<IActionResult> GetClientHealth(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        var result = await clientService.GetClientHealthAsync(id, businessId, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        Guid businessId,
        [FromBody] CreateClientRequest request,
        CancellationToken cancellationToken)
    {
        var result = await clientService.CreateAsync(businessId, CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { businessId, id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid businessId,
        Guid id,
        [FromBody] UpdateClientRequest request,
        CancellationToken cancellationToken)
    {
        var result = await clientService.UpdateAsync(id, businessId, CurrentUserId, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid businessId, Guid id, CancellationToken cancellationToken)
    {
        await clientService.DeleteAsync(id, businessId, CurrentUserId, cancellationToken);
        return NoContent();
    }
}

/*
📘 Why nested routes like /api/businesses/{businessId}/clients? This is RESTful resource nesting. 
A client belongs to a business, so the URL structure reflects that hierarchy. 
It also means businessId is always present in every client request
making it impossible to accidentally call a client endpoint without specifying which business you're operating on. 
This reinforces our multi-tenancy model at the HTTP level.
*/
