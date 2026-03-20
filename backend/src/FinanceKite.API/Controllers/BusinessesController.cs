using System;

namespace FinanceKite.API.Controllers;

using FinanceKite.Application.Features.Businesses;
using Microsoft.AspNetCore.Mvc;

public class BusinessesController(BusinessService businessService) : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await businessService.GetAllAsync(CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await businessService.GetByIdAsync(id, CurrentUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateBusinessRequest request,
        CancellationToken cancellationToken)
    {
        var result = await businessService.CreateAsync(CurrentUserId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateBusinessRequest request,
        CancellationToken cancellationToken)
    {
        var result = await businessService.UpdateAsync(id, CurrentUserId, request, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await businessService.DeleteAsync(id, CurrentUserId, cancellationToken);
        return NoContent();
    }
}

/*
📘 Why CreatedAtAction for POST? 
This returns an HTTP 201 Created response (not 200 OK) and includes a Location header pointing to the URL of the newly created resource. 
This is the correct REST convention for resource creation
the frontend can immediately follow the Location header to fetch the new resource.

📘 Why NoContent() for DELETE? A successful delete has nothing to return. 
HTTP 204 No Content correctly communicates "it worked, there's nothing to send back."

📘 Why CancellationToken on every action? When a user navigates away or closes the browser mid-request, 
ASP.NET Core signals a CancellationToken. 
Passing it through to your async database calls means EF Core will cancel the in-progress query, 
freeing up database connections and server resources immediately. Always thread it through.
*/
